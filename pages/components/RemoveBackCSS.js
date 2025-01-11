export default function RemoveBackCSS() {
    const cssCode = `html { background-color: transparent !important; } body { background-color: transparent !important; }`;
    return (
      <div>
        <pre>{cssCode}</pre>
      </div>
    );
}