import google.generativeai as genai


FETCH_DOCUMENT_DETAILS = genai.protos.Tool(
    function_declarations=[
        genai.protos.FunctionDeclaration(
            name="fetch_document_details",
            description="Retrieve and analyze complete details of a document from Regulations.gov, including full metadata and text content, to support comprehensive policy analysis.",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "link": genai.protos.Schema(
                        type=genai.protos.Type.STRING,
                        description="The API endpoint link for the document. Use this to access detailed content and metadata.",
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
