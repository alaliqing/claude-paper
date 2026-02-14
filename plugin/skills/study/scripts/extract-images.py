#!/usr/bin/env python3
"""
Extract images from PDF files using PyMuPDF.
This script extracts images from PDF pages and saves them to a specified directory.

Usage: python extract-images.py <pdf-path> <output-dir>
"""

import sys
import os
import fitz  # PyMuPDF
from pathlib import Path

def extract_images(pdf_path, output_dir):
    """
    Extract images from a PDF file.

    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory to save extracted images

    Returns:
        List of extracted image file paths
    """
    # Create output directory if it doesn't exist
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Open PDF document
    doc = fitz.open(pdf_path)
    extracted = []

    # Image counter for naming
    img_counter = 0
    page_images = {}  # Track images per page

    print(f"Processing PDF: {pdf_path}")
    print(f"Total pages: {len(doc)}")

    # Extract images from each page
    for page_num, page in enumerate(doc, start=1):
        image_list = page.get_images(full=True)
        if image_list:
            page_images[page_num] = len(image_list)
            print(f"Page {page_num}: Found {len(image_list)} image(s)")

        for img_index, img in enumerate(image_list, start=1):
            xref = img[0]
            base_image = doc.extract_image(xref)

            if base_image:
                image_bytes = base_image["image"]

                # Generate filename based on page and image index
                # e.g., page_1_img_1.png
                filename = f"page_{page_num}_img_{img_index}.{base_image['ext']}"
                filepath = output_path / filename

                # Save image
                with open(filepath, "wb") as f:
                    f.write(image_bytes)

                extracted.append(str(filepath))
                img_counter += 1

    # Also extract pages as images if few images found
    if img_counter < 3 and len(doc) > 0:
        print("Few images extracted, generating page previews...")
        # Extract first 3 pages as previews
        for page_num in range(1, min(4, len(doc) + 1)):
            page = doc[page_num - 1]
            pix = page.get_pixmap()

            filename = f"page_{page_num}_preview.png"
            filepath = output_path / filename

            pix.save(str(filepath))
            extracted.append(str(filepath))
            img_counter += 1

    doc.close()

    print(f"\nSummary:")
    print(f"  Total images extracted: {img_counter}")
    print(f"  Images by page: {page_images}")

    return extracted

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extract-images.py <pdf-path> <output-dir>", file=sys.stderr)
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_dir = sys.argv[2]

    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    try:
        extracted = extract_images(pdf_path, output_dir)
        # Output JSON list of extracted images
        import json
        print(json.dumps(extracted))
    except Exception as e:
        print(f"Error extracting images: {e}", file=sys.stderr)
        sys.exit(1)
