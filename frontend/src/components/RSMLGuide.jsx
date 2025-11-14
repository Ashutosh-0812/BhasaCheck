import React, { useState } from "react";

export default function RSMLGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  const examples = [
    {
      title: "Tags (@)",
      description: "Use @ to create semantic tags",
      example: "The speaker @hesitated before answering the question.",
      rendered: "The speaker [hesitated] before answering the question."
    },
    {
      title: "Entities (#)",
      description: "Use # to mark named entities",
      example: "I live in #Mumbai and work at #Microsoft.",
      rendered: "I live in [Mumbai] and work at [Microsoft]."
    },
    {
      title: "Languages (!)",
      description: "Use ! to mark language switches",
      example: "He said !hindi{नमस्ते} and then !english{hello}.",
      rendered: "He said [नमस्ते] and then [hello]."
    },
    {
      title: "Complex Example",
      description: "Combining multiple annotation types",
      example: "The #customer was @frustrated when !hindi{समस्या} occurred.",
      rendered: "The [customer] was [frustrated] when [समस्या] occurred."
    }
  ];

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="bi bi-question-circle me-2"></i>
          RSML Annotation Guide
        </h6>
        <button 
          className="btn btn-sm btn-outline-primary"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <i className="bi bi-chevron-up me-1"></i>
              Hide Guide
            </>
          ) : (
            <>
              <i className="bi bi-chevron-down me-1"></i>
              Show Guide
            </>
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="card-body">
          <p className="text-muted mb-3">
            RSML (Rich Semantic Markup Language) allows you to add semantic annotations to text. 
            Here are the available annotation types:
          </p>
          
          <div className="row">
            {examples.map((example, index) => (
              <div key={index} className="col-12 col-md-6 mb-3">
                <div className="border rounded p-3 h-100">
                  <h6 className="text-primary mb-2">{example.title}</h6>
                  <p className="small text-muted mb-2">{example.description}</p>
                  <div className="mb-2">
                    <strong>Type this:</strong>
                    <code className="d-block bg-light p-2 rounded mt-1 small">
                      {example.example}
                    </code>
                  </div>
                  <div>
                    <strong>You'll see:</strong>
                    <div className="bg-light p-2 rounded mt-1 small">
                      {example.rendered}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="alert alert-info mt-3">
            <i className="bi bi-lightbulb me-2"></i>
            <strong>Tip:</strong> As you type in the text areas below, you'll see real-time preview 
            of your annotations in the right panel. Try the examples above!
          </div>
        </div>
      )}
    </div>
  );
}