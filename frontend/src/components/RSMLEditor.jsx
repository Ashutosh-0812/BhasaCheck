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
      
      // Destroy previous annotator instance if exists
      if (annotatorRef.current) {
        annotatorRef.current = null;
      }
      
      // Only remove suggestion boxes from OTHER segments/editors
      const removeSuggestions = () => {
        const allBoxes = document.querySelectorAll('.rsml-suggestions, .tag-suggestions, .language-suggestions, .entity-suggestions');
        allBoxes.forEach(box => {
          // Check if this box belongs to a different editor
          const parent = box.closest('[data-editor-id]');
          if (!parent || parent.dataset.editorId !== uniqueId.current) {
            try {
              box.remove();
            } catch(e) {}
          }
        });
      };
      
      removeSuggestions();
      
      // Create new annotator
      const timeoutId = setTimeout(() => {
        annotatorRef.current = new RSMLAnnotator({
          textarea: textareaRef.current,
          output: outputRef.current,
        });

        if (initialText) {
          textareaRef.current.value = initialText;
          const event = new Event('input', { bubbles: true });
          textareaRef.current?.dispatchEvent(event);
        }
      }, 100);

      const handleInput = (e) => {
        onTextChange(e.target.value);
      };
      
      textareaRef.current.addEventListener('input', handleInput);
      
      return () => {
        clearTimeout(timeoutId);
        
        if (textareaRef.current) {
          textareaRef.current.removeEventListener('input', handleInput);
        }
        
        // Only remove suggestion boxes from this editor on cleanup
        const myBoxes = containerRef.current?.querySelectorAll('.rsml-suggestions, .tag-suggestions, .language-suggestions, .entity-suggestions');
        myBoxes?.forEach(box => {
          try {
            box.remove();
          } catch(e) {}
        });
        
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