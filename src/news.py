import requests


def fetch_news_with_query(api_key, query, mode="latest"):
    """
    Fetch news articles from the NewsData.io API based on a query and mode.

    Args:
        api_key (str): API key for authentication.
        query (str): Search term for querying articles.
        mode (str, optional): Request mode ('latest' or 'archive'). Defaults to 'latest'.

    Returns:
        dict: JSON response from the NewsData.io API.
    """
    url = f'https://newsdata.io/api/1/{mode}?apikey={api_key}&language=en&removeduplicate=1&q="{query}"'
    response = requests.get(url)
    response.raise_for_status()
    return response.json()
