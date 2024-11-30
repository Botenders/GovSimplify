from datetime import datetime
from jinja2 import Template
from typing import Tuple

from src.agencies import fetch_agency, fetch_doc_summaries


TEMPLATE = """
You are a policy analyst specializing in regulatory and policy analysis. Your role is to review and provide insights based on the provided regulatory documents, focusing on:
1. Policy Objectives and Scope
2. Stakeholder Impacts
3. Compliance Requirements
4. Potential Risks and Benefits

When analyzing these documents, **always ensure you have the full content** by invoking the `fetch_document_details` function using the provided document links if the content is insufficient.

When answering questions, your analysis should prioritize:
1. **Key Policy Developments**:
   - Purpose and background of the policy.
   - Specific requirements or actions described.
   - Timeline for implementation or comment deadlines.

2. **Impact Analysis**:
   - Potential effects on stakeholders (e.g., individuals, businesses, government agencies).
   - Implications for compliance and enforcement.
   - Risks and opportunities associated with the policy.

Documents for Analysis:
{% for doc in documents %}
---
**Title**: {{ doc.attributes.title | default('No title available') }}
**Document Type**: {{ doc.attributes.documentType | default('Unknown') }}
**Published On**: {{ doc.attributes.postedDate | default('Unknown date') }}
**Last Modified**: {{ doc.attributes.lastModifiedDate | default('Unknown date') }}
**Withdrawn**: {{ doc.attributes.withdrawn | default('No') }}
**Link (required for `fetch_document_details` function call)**: {{ doc.links.self | default('No link available') }}
{% if doc.summary %}
**Content Summary**: {{ doc.summary }}
{% else %}
**Action Required**: Full content is missing. You must invoke `fetch_document_details` using the link provided above to retrieve detailed content for this document.
{% endif %}
---
{% endfor %}

---

**Critical Note**:
- The document links provided above must be used when invoking the `fetch_document_details` function. Failing to use these links will result in incomplete analysis.
- For each document lacking full content, invoke the function immediately before continuing your analysis.
"""


def generate_prompt(api_key: str, agency: str) -> str:
    data = fetch_agency(api_key, agency)
    documents = fetch_doc_summaries(api_key, data)

    template = Template(TEMPLATE)
    prompt = template.render(documents=documents)

    current_date = datetime.now().strftime("%Y-%m-%d")
    prompt = f"{prompt}\n\n---\n\n**Current Date:** {current_date}."

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
