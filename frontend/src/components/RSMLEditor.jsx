import React, { useEffect, useRef } from "react";
import RSMLAnnotator from "rsml";

export default function RSMLEditor({ 
  initialText = "", 
  placeholder = "Type @ for tags, # for entities, ! for languages...",
  onTextChange = () => {},
  title = "Text Editor",
  segmentId = null // Add segmentId to make each editor unique
}) {
  const textareaRef = useRef(null);
  const outputRef = useRef(null);
  const annotatorRef = useRef(null);
  const containerRef = useRef(null);
  const uniqueId = useRef(`rsml-${segmentId}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (textareaRef.current && outputRef.current && containerRef.current) {
      // Clear previous content
      textareaRef.current.value = initialText || "";
      outputRef.current.innerHTML = "";
      
      // IMPORTANT: Remove ALL suggestion boxes from the document before creating new annotator
      const allSuggestionBoxes = document.querySelectorAll('.rsml-suggestions, .tag-suggestions, [class*="suggestion"]');
      allSuggestionBoxes.forEach(box => box.remove());
      
      // Destroy previous annotator instance if exists
      if (annotatorRef.current) {
        annotatorRef.current = null;
      }
      
      // Small delay to ensure DOM is clean
      setTimeout(() => {
        // Create new annotator instance
        annotatorRef.current = new RSMLAnnotator({
          textarea: textareaRef.current,
          output: outputRef.current,
        });

        // Set initial text if provided
        if (initialText) {
          textareaRef.current.value = initialText;
          const event = new Event('input', { bubbles: true });
          textareaRef.current?.dispatchEvent(event);
        }
      }, 50);

      // Add event listener for text changes
      const handleInput = (e) => {
        onTextChange(e.target.value);
      };
      
      textareaRef.current.addEventListener('input', handleInput);
      
      // Cleanup
      return () => {
        if (textareaRef.current) {
          textareaRef.current.removeEventListener('input', handleInput);
        }
        
        // Remove ALL suggestion boxes on cleanup
        const suggestions = document.querySelectorAll('.rsml-suggestions, .tag-suggestions, [class*="suggestion"]');
        suggestions.forEach(el => el.remove());
        
        annotatorRef.current = null;
      };
    }
  }, [segmentId]);

  // Update textarea when initialText changes (but don't recreate annotator)
  useEffect(() => {
    if (textareaRef.current && annotatorRef.current && initialText) {
      textareaRef.current.value = initialText;
      const event = new Event('input', { bubbles: true });
      textareaRef.current.dispatchEvent(event);
    }
  }, [initialText]);

  return (
    <div className="rsml-editor-container mb-3" ref={containerRef} data-editor-id={uniqueId.current}>
      <div className="row g-3">
        <div className="col-12 col-md-6" style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            className="form-control rsml-textarea"
            rows="8"
            placeholder={placeholder}
            data-segment={segmentId}
            style={{ 
              minHeight: "250px",
              fontFamily: "monospace",
              fontSize: "14px"
            }}
          />
        </div>
        <div className="col-12 col-md-6">
          <div
            ref={outputRef}
            className="rsml-output border rounded p-3"
            style={{
              minHeight: "250px",
              maxHeight: "250px",
              overflowY: "auto",
              backgroundColor: "#ffffff",
              fontSize: "14px"
            }}
          />
        </div>
      </div>
    </div>
  );
}