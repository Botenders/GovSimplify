import re
import requests
from bs4 import BeautifulSoup
from collections.abc import Iterable

GOV_URL = "https://api.regulations.gov/v4/documents"


def fetch_agency(api_key, agency, filters="Notice,Rule,Proposed Rule"):
    """
    Fetch documents for a specific agency filtered by document type.

    Args:
        api_key (str): API key for the Regulations.gov API.
        agency (str): The agency ID to fetch documents for.
        filters (str): Document types to include in the results.

    Returns:
        list: A list of documents that match the specified agency and document types.
    """

    # Fetch metadata to determine total pages
    metadata_url = f"{GOV_URL}?filter[agencyId]={agency}&filter[documentType]={filters}&api_key={api_key}&page[size]=250&page[number]=1"
    metadata_res = requests.get(metadata_url)
    metadata_res.raise_for_status()
    metadata = metadata_res.json().get("meta", {})
    total_pages = metadata.get("totalPages", 0)

    if not total_pages:
        raise Exception("No pages found in metadata for the given agency.")

    # Fetch documents across all pages
    results = []
    for page in range(1, total_pages + 1):
        url = f"{GOV_URL}?filter[agencyId]={agency}&filter[documentType]={filters}&api_key={api_key}&page[size]=250&page[number]={page}"
        res = requests.get(url)
        res.raise_for_status()
        data = res.json().get("data", [])

        # Filter and add relevant documents
        results.extend(
            result
            for result in data
            if result.get("attributes", {}).get("documentType") in filters
        )

    return results


def download_and_parse_htm(file_url):
    """
    Downloads an .htm file, extracts meaningful content, and cleans it to minimize token count
    while preserving important information.

    Args:
        file_url (str): URL of the .htm file to download.

    Returns:
        str: Cleaned and formatted text content from the HTML document.
    """
    try:
        # Step 1: Download the HTML content
        response = requests.get(file_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Step 2: Extract the main <PRE> tag content
        pre_tag = soup.find("pre")
        if not pre_tag:
            raise ValueError("No <PRE> tag found in the document.")
        raw_text = pre_tag.get_text(separator="\n")

        # Step 3: Define patterns to remove non-essential content
        removable_patterns = [
            r"^\[\s*Federal Register.*?\]\s*$",  # Federal Register header
            r"^\[\s*DOCID:.*?\]\s*$",  # DOCID line
            r"^\s*\[Page.*?\]\s*$",  # Page numbers
            r"^BILLING CODE.*?$",  # Billing code
            r"From the Federal Register Online.*?$",  # Source line
            r"^\[FR Doc.*?\]\s*$",  # FR Doc line
            r"\s*_{3,}\s*$",  # Separator lines
            r"^\s+$",  # Empty lines
        ]

        # Step 4: Clean the text line by line
        cleaned_lines = []
        for line in raw_text.split("\n"):
            # Skip lines matching removable patterns
            if any(re.match(pattern, line) for pattern in removable_patterns):
                continue

            # Clean up excessive whitespace
            line = re.sub(r"\s+", " ", line).strip()

            if line:  # Only keep non-empty lines
                cleaned_lines.append(line)

        # Step 5: Join lines and normalize spacing
        cleaned_text = "\n".join(cleaned_lines)
        cleaned_text = re.sub(
            r"\n{3,}", "\n\n", cleaned_text
        )  # Limit consecutive newlines

        # Step 6: Preserve important sections while removing redundant formatting
        cleaned_text = re.sub(
            r"(\w+:)\s+", r"\1 ", cleaned_text
        )  # Normalize label formatting

        return cleaned_text.strip()

    except Exception as e:
        raise RuntimeError(f"Failed to process {file_url}: {e}")


def fetch_document(api_key, link):
    """
    Fetches the metadata for a specific document and returns the file URL.

    Args:
        api_key (str): API key for Regulations.gov API.
        link (str): API link for the document.

    Returns:
        str: The URL of the document's .htm or .html file.

    Raises:
        RuntimeError: If the request fails, the response is invalid, or no valid file URL is found.
    """
    try:
        # Make the API request
        res = requests.get(f"{link}?api_key={api_key}")
        res.raise_for_status()

        # Parse the response JSON
        data = res.json().get("data")
        if not data:
            raise ValueError("No 'data' field found in the API response.")

        # Access attributes and file formats
        attr = data.get("attributes")
        if not attr:
            raise ValueError("No 'attributes' field found in the document data.")

        # Look for .htm or .html file formats
        for file in attr.get("fileFormats", []):
            if file.get("format") in {"htm", "html"}:
                return file.get("fileUrl")

        # Raise an error if no valid file URL is found
        raise ValueError(
            "No .htm or .html file URL found in the document's fileFormats."
        )

    except requests.exceptions.RequestException as e:
        raise RuntimeError(
            f"Failed to fetch document metadata due to a request error: {e}"
        )
    except Exception as e:
        raise RuntimeError(f"Failed to fetch document metadata: {e}")


def fetch_metadata(api_key, link):
    """
    Fetches metadata for a document from the Regulations.gov API.

    Args:
        api_key (str): API key for accessing the API.
        link (str): API endpoint link for the document.

    Returns:
        dict: Metadata for the document.

    Raises:
        ValueError: If the response is missing expected fields.
        requests.RequestException: If the API request fails.
    """
    response = requests.get(f"{link}?api_key={api_key}")
    response.raise_for_status()
    data = response.json()

    if not data:
        raise ValueError("No data found in the API response.")

    return data


def get_html_file_url(metadata):
    """
    Extracts the URL of the HTML file from document metadata.

    Args:
        metadata (dict): Metadata for the document.

    Returns:
        str: URL of the HTML file.

    Raises:
        ValueError: If no HTML file URL is found.
    """
    file_formats = metadata.get("fileFormats", [])
    html_file = next(
        (
            file.get("fileUrl")
            for file in file_formats
            if file.get("format") in {"htm", "html"}
        ),
        None,
    )
    if not html_file:
        raise ValueError("No HTML file found in the document formats.")
    return html_file


def fetch_document_details(api_key, link):
    """
    Fetches and parses the details of a document from Regulations.gov.

    Args:
        api_key (str): API key for accessing the Regulations.gov API.
        link (str): API endpoint link for the document.

    Returns:
        dict: Structured output containing the document's metadata and content.

    Raises:
        RuntimeError: If fetching or parsing the document fails.
    """
    try:
        # Step 1: Fetch document metadata
        metadata = fetch_metadata(api_key, link)
        metadata = metadata.get("data")
        if not metadata:
            raise RuntimeError("Response does not contain 'data' key.")
        metadata = metadata.get("attributes")
        if not metadata:
            raise RuntimeError("Metadata does not contain 'attributes' key.")

        # Step 2: Extract the HTML file URL
        html_file_url = get_html_file_url(metadata)

        # Step 3: Download and parse the HTML content
        content = download_and_parse_htm(html_file_url)

        # Step 4: Return structured data
        return {
            "title": metadata.get("title", "No title available"),
            "documentType": metadata.get("documentType", "Unknown type"),
            "docketId": metadata.get("docketId", "No docket ID"),
            "content": content,
            "link": html_file_url,
        }

    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"Failed to fetch document metadata: {e}")
    except ValueError as e:
        raise RuntimeError(f"Data error: {e}")
    except Exception as e:
        raise RuntimeError(f"An unexpected error occurred: {e}")
