from jinja2 import Template
from typing import Tuple

from src.agencies import fetch_agency, fetch_agency_documents


TEMPLATE = """
You are a policy analyst specializing in regulatory and policy analysis. Your role is to review and provide insights based on the provided regulatory documents, focusing on:
1. Policy Objectives and Scope
2. Stakeholder Impacts
3. Compliance Requirements
4. Potential Risks and Benefits

When analyzing these documents, emphasize:
1. Key Policy Developments:
    - Purpose and background of the policy.
    - Specific requirements or actions described.
    - Timeline for implementation or comment deadlines.

2. Impact Analysis:
    - Potential effects on stakeholders (e.g., individuals, businesses, government agencies).
    - Implications for compliance and enforcement.
    - Risks and opportunities associated with the policy.

Documents for Analysis:
{% for doc in documents %}
---
**Title**: {{ doc.attributes.title | default('No title available') }}
**Document Type**: {{ doc.attributes.documentType | default('Unknown') }}
**Docket ID**: {{ doc.attributes.docketId | default('No docket ID') }}
**Published On**: {{ doc.attributes.postedDate | default('Unknown date') }}
**Last Modified**: {{ doc.attributes.lastModifiedDate | default('Unknown date') }}
**Agency**: {{ doc.attributes.agencyId | default('Unknown agency') }}
**Comment Period**:
  - Start Date: {{ doc.attributes.commentStartDate | default('N/A') }}
  - End Date: {{ doc.attributes.commentEndDate | default('N/A') }}
**Open for Comment**: {{ doc.attributes.openForComment | default('Unknown') }}
**FR Document Number**: {{ doc.attributes.frDocNum | default('Not provided') }}
**Withdrawn**: {{ doc.attributes.withdrawn | default('No') }}
**Link to Document**: {{ doc.links.self | default('No link available') }}
**Content**:
{{ doc.content | default('Full content not available.') }}

{% if doc.content is none or doc.content == 'Full content not available.' %}
NOTE: This document does not include full content. To retrieve more information, invoke the `fetch_document_details` function with the following parameters:
- `link`: {{ doc.links.self | default('No link available') }}
{% endif %}
{% endfor %}
---

Analysis Guidelines:
- Focus on policy details provided in the documents.
- Highlight critical timelines or deadlines for stakeholder input.
- Explain the purpose and scope of each policy in accessible language.
- Address specific stakeholder concerns where applicable.
- Avoid speculation; base your analysis strictly on the provided content.
- Use precise source attribution, referencing document titles, dates, and docket IDs.

When answering questions, prioritize actionable insights and provide concise, clear responses grounded in the policy context.
"""


def generate_prompt(api_key: str, agency: str) -> str:
    documents = fetch_agency(api_key, agency)

    template = Template(TEMPLATE)
    prompt = template.render(documents=documents)

    return prompt


def determine_model_and_tokens(
    prompt: str, token_limit: int = 2_000_000
) -> Tuple[int, str]:
    """
    Determines the approximate token count for a given system instruction and selects the appropriate model.

    Args:
        prompt (str): The rendered system prompt.
        token_limit (int): Maximum token limit for the context. Defaults to 2 million.

    Returns:
        tuple: (approx_tokens, model_name)
    """
    # Calculate approximate token count (4 characters per token approximation)
    approx_tokens = len(prompt) // 4

    # Check if token count exceeds the limit
    if approx_tokens > token_limit:
        raise ValueError(f"Token count exceeds the limit of {token_limit}.")

    # Determine model based on token count thresholds
    model_name = "gemini-1.5-pro" if approx_tokens > 900_000 else "gemini-1.5-flash"

    return approx_tokens, model_name
