export default function RemoveBackCSS() {
    const cssCode = `body { background-color: transparent !important; }`;
    return (
      <div>
        <pre>{cssCode}</pre>
      </div>
    );
}