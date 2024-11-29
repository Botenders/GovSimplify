import google.generativeai as genai


FETCH_DOCUMENT_DETAILS = genai.protos.Tool(
    function_declarations=[
        genai.protos.FunctionDeclaration(
            name='fetch_document_details',
            description=(
                "Fetch the complete details of a regulatory document from Regulations.gov. "
                "This includes metadata, such as title, publication date, and document type, "
                "as well as the full text content for in-depth analysis. "
                "Use this function when the document's provided details are insufficient for a thorough review."
            ),
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    'link': genai.protos.Schema(
                        type=genai.protos.Type.STRING,
                        description=(
                            "The unique API endpoint URL for the document. "
                            "This link is required to retrieve the full metadata and content of the document."
                        )
                    )
                },
                required=['link']
            )
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
