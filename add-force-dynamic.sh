#!/bin/bash
# Script to add force-dynamic to PDF processing pages

# List of PDF processing pages that need force-dynamic
PDF_PAGES=(
  "src/app/merge-pdf/page.tsx"
  "src/app/split-pdf/page.tsx" 
  "src/app/rotate-pdf/page.tsx"
  "src/app/pdf-to-jpg/page.tsx"
  "src/app/ocr-pdf/page.tsx"
  "src/app/jpg-to-pdf/page.tsx"
  "src/app/remove-pages/page.tsx"
  "src/app/extract-pages/page.tsx"
  "src/app/compare-pdf/page.tsx"
  "src/app/compress-pdf/page.tsx"
  "src/app/watermark-pdf/page.tsx"
  "src/app/sign-pdf/page.tsx"
  "src/app/protect-pdf/page.tsx"
  "src/app/scan-to-pdf/page.tsx"
  "src/app/pagenumber-pdf/page.tsx"
  "src/app/crop-pdf/page.tsx"
  "src/app/word-to-pdf/page.tsx"
  "src/app/html-to-pdf/page.tsx"
  "src/app/powerpoint-to-pdf/page.tsx"
  "src/app/pdf-to-word/page.tsx"
  "src/app/pdf-to-powerpoint/page.tsx"
  "src/app/pdf-to-excel/page.tsx"
  "src/app/excel-to-pdf/page.tsx"
)

echo "Adding force-dynamic to PDF processing pages..."

for page in "${PDF_PAGES[@]}"; do
  if [[ -f "$page" ]]; then
    # Check if force-dynamic already exists
    if ! grep -q "export const dynamic = 'force-dynamic'" "$page"; then
      # Add force-dynamic after "use client" directive
      sed -i.bak '/"use client"/a\\nexport const dynamic = '\''force-dynamic'\''\\n' "$page"
      echo "✅ Added force-dynamic to $page"
    else
      echo "⚠️  force-dynamic already exists in $page"
    fi
  else
    echo "❌ File not found: $page"
  fi
done

echo "✅ Script completed!"
