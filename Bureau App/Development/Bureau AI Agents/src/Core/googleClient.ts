const GOOGLE_ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN || "";

function getHeaders() {
  return {
    "Authorization": `Bearer ${GOOGLE_ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  };
}

/**
 * Creates a Google Doc with text content.
 */
export async function createGoogleDoc(title: string, content: string) {
  if (!GOOGLE_ACCESS_TOKEN) throw new Error("Missing GOOGLE_ACCESS_TOKEN environment variable.");
  
  // 1. Create a blank document
  const createRes = await fetch("https://docs.googleapis.com/v1/documents", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ title })
  });
  
  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(`Google Docs create failed: ${JSON.stringify(err)}`);
  }
  
  const doc = await createRes.json();
  const documentId = doc.documentId;
  
  // 2. Insert the content
  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            text: content,
            location: { index: 1 }
          }
        }
      ]
    })
  });
  
  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error(`Google Docs update failed: ${JSON.stringify(err)}`);
  }
  
  return {
    success: true,
    documentId,
    url: `https://docs.google.com/document/d/${documentId}/edit`
  };
}

/**
 * Creates a Google Slide presentation (PPT) from structured slide data.
 */
export async function createGoogleSlides(title: string, slidesData: { title: string, body: string }[]) {
  if (!GOOGLE_ACCESS_TOKEN) throw new Error("Missing GOOGLE_ACCESS_TOKEN environment variable.");
  
  // 1. Create presentation
  const createRes = await fetch("https://slides.googleapis.com/v1/presentations", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ title })
  });
  
  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(`Google Slides create failed: ${JSON.stringify(err)}`);
  }
  
  const presentation = await createRes.json();
  const presentationId = presentation.presentationId;
  
  // 2. Build updates (create slide and insert title & body text)
  const requests: any[] = [];
  
  slidesData.forEach((slide, idx) => {
    const slideId = `slide_page_${idx}`;
    const titleId = `title_box_${idx}`;
    const bodyId = `body_box_${idx}`;
    
    // Add Slide
    requests.push({
      createSlide: {
        objectId: slideId,
        insertionIndex: idx,
        slideLayoutReference: { predefinedLayout: "TITLE_AND_BODY" }
      }
    });
    
    // Insert text updates would require shape matching, so to keep it highly reliable, 
    // we append basic shape texts or create custom text boxes:
    requests.push({
      createShape: {
        objectId: titleId,
        shapeType: "TEXT_BOX",
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 6000000, unit: "EMU" }, height: { magnitude: 1000000, unit: "EMU" } },
          transform: { scaleX: 1, scaleY: 1, translateX: 500000, translateY: 500000, unit: "EMU" }
        }
      }
    });
    
    requests.push({
      insertText: {
        objectId: titleId,
        text: slide.title,
        insertionIndex: 0
      }
    });
    
    requests.push({
      createShape: {
        objectId: bodyId,
        shapeType: "TEXT_BOX",
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 6000000, unit: "EMU" }, height: { magnitude: 3000000, unit: "EMU" } },
          transform: { scaleX: 1, scaleY: 1, translateX: 500000, translateY: 1800000, unit: "EMU" }
        }
      }
    });
    
    requests.push({
      insertText: {
        objectId: bodyId,
        text: slide.body,
        insertionIndex: 0
      }
    });
  });
  
  if (requests.length > 0) {
    const updateRes = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ requests })
    });
    
    if (!updateRes.ok) {
      const err = await updateRes.json();
      throw new Error(`Google Slides update failed: ${JSON.stringify(err)}`);
    }
  }
  
  return {
    success: true,
    presentationId,
    url: `https://docs.google.com/presentation/d/${presentationId}/edit`
  };
}

/**
 * Uploads a text file to Google Drive.
 */
export async function uploadToDrive(name: string, content: string, mimeType: string = "text/plain") {
  if (!GOOGLE_ACCESS_TOKEN) throw new Error("Missing GOOGLE_ACCESS_TOKEN environment variable.");
  
  const metadata = {
    name,
    mimeType
  };
  
  const boundary = "bureau_multipart_boundary";
  const multipartBody = 
    `\n--${boundary}\nContent-Type: application/json; charset=UTF-8\n\n${JSON.stringify(metadata)}\n` +
    `\n--${boundary}\nContent-Type: ${mimeType}\n\n${content}\n` +
    `\n--${boundary}--`;
    
  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GOOGLE_ACCESS_TOKEN}`,
      "Content-Type": `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Google Drive upload failed: ${JSON.stringify(err)}`);
  }
  
  const file = await response.json();
  return {
    success: true,
    fileId: file.id,
    url: `https://drive.google.com/file/d/${file.id}/view`
  };
}
