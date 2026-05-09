#!/usr/bin/env python3

import argparse
import json
import sys
import urllib.request
import urllib.parse
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime

ARXIV_API_URL = "http://export.arxiv.org/api/query"

def build_query(search_terms, date_range=None):
    parts = []
    for term in search_terms:
        if ":" in term:
            parts.append(term)
        else:
            parts.append(f"all:{term}")
    query = " AND ".join(parts)
    if date_range:
        start_date, end_date = date_range
        date_filter = f"submittedDate:[{start_date.strftime('%Y%m%d0000')} TO {end_date.strftime('%Y%m%d2359')}]"
        query = f"{query} AND {date_filter}"
    return query

def fetch_papers(query, max_results, sort_by, start_offset):
    sort_map = {
        "relevance": "relevance",
        "date": "lastUpdatedDate",
    }
    sort_value = sort_map.get(sort_by, "relevance")

    params = {
        "search_query": query,
        "start": str(start_offset),
        "max_results": str(max_results),
        "sortBy": sort_value,
        "sortOrder": "descending",
    }

    url = f"{ARXIV_API_URL}?{urllib.parse.urlencode(params)}"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "pilot-research/1.0"})
        with urllib.request.urlopen(req, timeout=30) as response:
            data = response.read().decode("utf-8")
    except urllib.error.URLError as e:
        print(f"Network error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error fetching from ArXiv: {e}", file=sys.stderr)
        sys.exit(1)

    return parse_response(data)

def parse_response(xml_data):
    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "arxiv": "http://arxiv.org/schemas/atoms",
        "opensearch": "http://a9.com/-/spec/opensearch/1.1/",
    }

    try:
        root = ET.fromstring(xml_data)
    except ET.ParseError as e:
        print(f"Error parsing ArXiv response: {e}", file=sys.stderr)
        sys.exit(1)

    total_results = root.find("opensearch:totalResults", ns)
    total = int(total_results.text) if total_results is not None else 0

    entries = root.findall("atom:entry", ns)
    papers = []

    for entry in entries:
        title_el = entry.find("atom:title", ns)
        summary_el = entry.find("atom:summary", ns)
        published_el = entry.find("atom:published", ns)
        id_el = entry.find("atom:id", ns)

        if id_el is None:
            continue

        arxiv_url = id_el.text.strip()
        arxiv_id = arxiv_url.split("/abs/")[-1] if "/abs/" in arxiv_url else arxiv_url.split("/")[-1]

        authors = []
        for author_el in entry.findall("atom:author", ns):
            name_el = author_el.find("atom:name", ns)
            if name_el is not None:
                authors.append(name_el.text.strip())

        categories = []
        for cat_el in entry.findall("atom:category", ns):
            term = cat_el.get("term")
            if term:
                categories.append(term)

        title = title_el.text.strip().replace("\n", " ") if title_el is not None else ""
        abstract = summary_el.text.strip().replace("\n", " ") if summary_el is not None else ""
        published = published_el.text.strip()[:10] if published_el is not None else ""

        pdf_url = arxiv_url.replace("/abs/", "/pdf/") + ".pdf"

        papers.append({
            "arxiv_id": arxiv_id,
            "title": title,
            "authors": authors,
            "abstract": abstract,
            "published": published,
            "categories": categories,
            "pdf_url": pdf_url,
        })

    return {"total_results": total, "papers": papers}

def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        print(f"Invalid date format: {date_str}. Use YYYY-MM-DD.", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="Query the ArXiv API and return structured JSON results."
    )
    parser.add_argument(
        "query",
        nargs="+",
        help="Search terms. Use 'cat:cs.AI' for category filters, or plain keywords.",
    )
    parser.add_argument(
        "--max-results",
        type=int,
        default=10,
        help="Maximum number of results (default: 10)",
    )
    parser.add_argument(
        "--sort-by",
        choices=["relevance", "date"],
        default="relevance",
        help="Sort order: relevance or date (default: relevance)",
    )
    parser.add_argument(
        "--start-date",
        help="Start date filter (YYYY-MM-DD)",
    )
    parser.add_argument(
        "--end-date",
        help="End date filter (YYYY-MM-DD)",
    )
    parser.add_argument(
        "--offset",
        type=int,
        default=0,
        help="Offset for pagination (default: 0)",
    )

    args = parser.parse_args()

    date_range = None
    if args.start_date or args.end_date:
        start = parse_date(args.start_date) if args.start_date else datetime(1991, 1, 1)
        end = parse_date(args.end_date) if args.end_date else datetime.now()
        date_range = (start, end)

    query = build_query(args.query, date_range)
    result = fetch_papers(query, args.max_results, args.sort_by, args.offset)

    print(json.dumps(result, indent=2, ensure_ascii=False))

    if not result["papers"]:
        print("No results found.", file=sys.stderr)

if __name__ == "__main__":
    main()