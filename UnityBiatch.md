# Integrating a Unity WebGL Board Dashboard (Test Feature)

This guide explains how to add a Unity WebGL-powered Board dashboard to your app as a test feature, sitting alongside your existing React-based views. The Unity view will be visually distinct (red) to indicate its experimental status.

---

## 1. Build the Unity WebGL Board

- **Design your board dashboard in Unity** (using Canvas, Panels, Prefabs, etc.).
- **Implement drag-and-drop, data fetching, and UI logic** in C#.
- **Test the dashboard in the Unity Editor.**
- **Export as WebGL:**
  - Go to `File → Build Settings → WebGL → Build`.
  - Unity will generate a folder with `index.html`, `Build/`, and `TemplateData/`.
- **Test the WebGL build locally** to ensure it works in a browser.

---

## 2. Add Unity WebGL Build to React App

- Copy the entire Unity WebGL build output (e.g., `index.html`, `Build/`, `TemplateData/`) into your React app's `public/unity-board/` directory.
- The final structure should look like:
  ```
  client/public/unity-board/
    ├── index.html
    ├── Build/
    └── TemplateData/
  ```

---

## 3. Add a New React View for Unity Board

- Create a new component, e.g., `UnityBoardView.jsx`:

  ```jsx
  import React from 'react';

  const UnityBoardView = () => (
    <div style={{
      border: '5px solid red',
      background: '#ffeaea',
      padding: '10px',
      height: '100vh'
    }}>
      <h2 style={{ color: 'red', textAlign: 'center' }}>
        Unity Board Dashboard (Test Feature)
      </h2>
      <iframe
        src="/unity-board/index.html"
        title="Unity Board Dashboard"
        style={{ width: '100%', height: '90vh', border: 'none' }}
      />
    </div>
  );

  export default UnityBoardView;
  ```

---

## 4. Update Navigation in React

- Add a button/tab in your main navigation to access the new Unity board view:

  ```jsx
  // ...existing code...
  <button onClick={() => setView('unity-board')}>Board (Unity Test)</button>
  // ...existing code...
  {view === 'unity-board' && <UnityBoardView />}
  ```

---

## 5. Data Sync & Backend Integration

- The Unity WebGL board can fetch and update data from your backend using HTTP requests (UnityWebRequest in C#).
- Ensure CORS is enabled on your backend if the Unity build is served from a different origin.
- Use the same REST API endpoints as your React app for consistency.

---

## 6. Visual Distinction

- The Unity board view should have a red border, background, or banner to indicate it is a test/experimental feature.
- You can further add a "Test Feature" label or warning in the UI.

---

## 7. Considerations

- **Performance:** Unity WebGL builds can be large and may take time to load.
- **Browser Support:** Supported in all modern browsers, but limited on mobile.
- **Isolation:** The Unity view is sandboxed (e.g., in an iframe) and won't interfere with your React app.
- **Data Consistency:** Both the React and Unity boards should use the same backend for real-time data consistency.

---

## 8. Summary Table

| Feature                | Standard Board | Unity Board (Test) |
|------------------------|----------------|--------------------|
| Technology             | React/JSX      | Unity WebGL        |
| Location               | `/board`       | `/unity-board`     |
| Visual Indicator       | Standard       | Red theme/border   |
| Data Source            | Same backend   | Same backend       |
| User Access            | Main nav       | Main nav           |

---

## 9. Next Steps

- Build and test your Unity WebGL dashboard.
- Integrate it into your React app as described above.
- Gather feedback and iterate! 