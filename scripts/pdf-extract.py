#!/usr/bin/env python3

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
import tempfile

def download_pdf(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "pilot-research/1.0"})
        with urllib.request.urlopen(req, timeout=60) as response:
            data = response.read()
    except urllib.error.URLError as e:
        print(f"Error downloading PDF: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error fetching URL: {e}", file=sys.stderr)
        sys.exit(1)

    tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    tmp.write(data)
    tmp.close()
    return tmp.name

def extract_with_pypdf2(pdf_path):
    from PyPDF2 import PdfReader

    reader = PdfReader(pdf_path)
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return pages

def extract_text(pdf_path):
    try:
        pages = extract_with_pypdf2(pdf_path)
        return pages
    except ImportError:
        print(
            "PyPDF2 is not installed. Install it with: pip install PyPDF2",
            file=sys.stderr,
        )
        print(
            "PDF text extraction requires PyPDF2. Falling back to metadata-only output.",
            file=sys.stderr,
        )
        return None

def main():
    parser = argparse.ArgumentParser(
        description="Extract text from PDF files or URLs."
    )
    parser.add_argument(
        "source",
        help="PDF file path or URL (http/https)",
    )
    parser.add_argument(
        "--format",
        choices=["text", "json"],
        default="text",
        help="Output format: text or json (default: text)",
    )
    parser.add_argument(
        "--pages-only",
        action="store_true",
        help="Output each page separately (json format only)",
    )

    args = parser.parse_args()

    is_url = args.source.startswith("http://") or args.source.startswith("https://")

    if is_url:
        pdf_path = download_pdf(args.source)
        cleanup = True
    else:
        pdf_path = os.path.abspath(args.source)
        cleanup = False
        if not os.path.isfile(pdf_path):
            print(f"Error: File not found: {pdf_path}", file=sys.stderr)
            sys.exit(1)

    pages = extract_text(pdf_path)

    if cleanup:
        try:
            os.unlink(pdf_path)
        except OSError:
            pass

    if pages is None:
        result = {
            "source": args.source,
            "error": "PyPDF2 not installed",
            "hint": "pip install PyPDF2",
            "pages": [],
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)

    if args.format == "json":
        result = {
            "source": args.source,
            "total_pages": len(pages),
            "pages": [{"page": i + 1, "text": t} for i, t in enumerate(pages)],
        }
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        for i, page_text in enumerate(pages):
            if args.pages_only:
                print(f"--- Page {i + 1} ---")
            print(page_text)
            if args.pages_only:
                print()

if __name__ == "__main__":
    main()