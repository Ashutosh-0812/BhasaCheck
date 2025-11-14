# BhasaCheck Frontend - Audio Dataset Viewer with RSML

This frontend application allows users to:
- Select parquet files containing audio datasets
- Browse segments within selected files  
- Play audio for each segment
- Edit verbatim and normalized text with RSML (Rich Semantic Markup Language) annotations
- Preview RSML annotations in real-time

## Features

### 🎧 Audio Playback
- Built-in audio player for each segment
- Download audio files
- Open audio in new tab

### ✏️ RSML Text Editing
The application includes powerful text annotation capabilities using RSML:

#### Annotation Types:
- **Tags (@)**: Semantic tags like `@hesitated`, `@laughing`, `@background_noise`
- **Entities (#)**: Named entities like `#Mumbai`, `#Microsoft`, `#John_Smith`
- **Languages (!)**: Language switches like `!hindi{नमस्ते}`, `!english{hello}`

#### Example Usage:
```
The #customer was @frustrated when !hindi{समस्या} occurred.
```

This renders as: The [customer] was [frustrated] when [समस्या] occurred.

### 📱 Responsive Design
- Mobile-friendly layout using Bootstrap 5
- Collapsible RSML guide
- Side-by-side text editing and preview

## Getting Started

1. **Start the Backend**: Make sure your backend server is running on `http://localhost:4000`

2. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Open Browser**: Navigate to `http://localhost:5173`

## Usage Workflow

1. **Select Parquet File**: Choose from available parquet files
2. **Select File**: Pick a specific file within the parquet
3. **Browse Segments**: View the list of audio segments
4. **Select Segment**: Click on a segment to load the editor
5. **Edit Text**: Use RSML annotations in the verbatim and normalized text areas
6. **Preview**: See real-time rendered output in the preview panels

## RSML Quick Reference

| Symbol | Purpose | Example | Preview |
|--------|---------|---------|---------|
| `@` | Semantic tags | `@hesitated` | [hesitated] |
| `#` | Named entities | `#Mumbai` | [Mumbai] |
| `!` | Language markers | `!hindi{नमस्ते}` | [नमस्ते] |

## Dependencies

- **React 19**: Frontend framework
- **Bootstrap 5**: UI components and styling
- **RSML**: Rich semantic markup language
- **Axios**: HTTP client for API calls
- **Vite**: Build tool and dev server

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── RSMLEditor.jsx      # RSML text editor component
│   │   ├── RSMLGuide.jsx       # Interactive RSML guide
│   │   └── SegmentViewer.jsx   # Main segment viewing component
│   ├── App.jsx                 # Main application component
│   ├── App.css                 # Custom styles
│   └── main.jsx               # Application entry point
├── index.html                 # HTML template
└── package.json              # Dependencies and scripts
```

## API Integration

The frontend expects these backend endpoints:
- `GET /api/parquets` - List available parquet files
- `GET /api/parquets/:pid/files` - List files in parquet
- `GET /api/parquets/:pid/files/:fid` - Get segments in file
- `GET /api/audio/:pid/:fid/:sid` - Get audio for segment

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
