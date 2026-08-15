import { toPng } from "html-to-image";

/**
 * Captures a DOM container and downloads it as a high-resolution PNG image.
 */
export async function exportTreeToPng(
  elementId: string,
  filename: string = "Family_Tree.png"
): Promise<boolean> {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error(`Export error: Element with ID "${elementId}" not found.`);
    return false;
  }

  try {
    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 2, // Crisp 2x Retina resolution
      backgroundColor: "#f8fafc", // Clean slate-50 canvas background
      filter: (domNode) => {
        // Exclude action buttons with no-export class
        if (domNode instanceof HTMLElement) {
          return !domNode.classList.contains("no-export");
        }
        return true;
      },
    });

    const link = document.createElement("a");
    link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.remove();
    }, 150);
    return true;
  } catch (err) {
    console.error("Failed to export family tree image:", err);
    throw err;
  }
}
