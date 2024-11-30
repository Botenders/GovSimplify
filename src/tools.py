import inspect
import google.generativeai as genai

from src.agencies import fetch_document_details


FETCH_DOCUMENT_DETAILS = genai.protos.Tool(
    function_declarations=[
        genai.protos.FunctionDeclaration(
            name="fetch_document_details",
            description=(
                "Fetch the complete details of a regulatory document from Regulations.gov. "
                "This includes metadata, such as title, publication date, and document type, "
                "as well as the full text content for in-depth analysis. "
                "Use this function when the document's provided details are insufficient for a thorough review."
            ),
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "link": genai.protos.Schema(
                        type=genai.protos.Type.STRING,
                        description=(
                            "The unique API endpoint URL for the document. "
                            "This link is required to retrieve the full metadata and content of the document."
                        ),
                    )
                },
                required=["link"],
            ),
        )
    ]
)

FETCH_LATEST_NEWS = genai.protos.Tool(
    function_declarations=[
        genai.protos.FunctionDeclaration(
            name="fetch_latest_news",
            description="Retrieve the latest news articles from a specific source or category to provide up-to-date information for analysis and insights.",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "query": genai.protos.Schema(
                        type=genai.protos.Type.STRING,
                        description="The search query or category to fetch news articles. Use this to specify the source or topic of interest.",
                    )
                },
                required=["query"],
            ),
        )
    ]
)


def parse_args_to_dict(args):
    """
    Converts an argument string (e.g., 'key1=value1, key2=value2') into a dictionary.

    Args:
        args_string (str): A string representing function arguments.

    Returns:
        dict: Parsed arguments as a dictionary.
    """
    args_dict = {}
    args_string = ", ".join(f"{key}={val}" for key, val in args.items())
    try:
        # Split the string into key-value pairs
        pairs = args_string.split(", ")
        for pair in pairs:
            if "=" in pair:
                # Split each pair into key and value
                key, value = pair.split("=", 1)  # Split on the first '=' only
                # Convert key-value pairs into dictionary entries
                args_dict[key] = value
    except Exception as e:
        print(f"Error parsing args: {e}")
    return args_dict


def execute_function_call(function_name, function_args, api_key):
    """
    Verifies the function signature and executes it dynamically.

    Args:
        function_name (str): The name of the function to call.
        function_args (dict): The arguments to pass to the function.
        api_key (str): The API key used to make the request.

    Returns:
        dict: A JSON response containing the result or error message.
    """

    function_args["api_key"] = api_key
    response = {
        "status": "success",
        "function": function_name,
        "result": None,
        "error": None,
    }

    try:
        # Step 1: Get the function object by name
        if function_name == "fetch_document_details":
            func = fetch_document_details
        else:
            func = None

        if not func:
            response["status"] = "error"
            response["error"] = f"Function '{function_name}' not found."
            return response

        # Step 2: Verify the function signature
        sig = inspect.signature(func)
        try:
            sig.bind(**function_args)  # Bind arguments to the function's signature
        except TypeError as e:
            response["status"] = "error"
            response["error"] = f"Argument mismatch: {str(e)}"
            return response

        # Step 3: Call the function with validated arguments
        response["result"] = func(**function_args)
        return response

    except Exception as e:
        response["status"] = "error"
        response["error"] = f"Unexpected error: {str(e)}"
        return response
