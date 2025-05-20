const proto = document.getElementById('proto');
const editor = document.getElementById('editor');

proto.addEventListener('input', () => {
    try {
        const url = new URL(proto.value.trim());
        const path = url.pathname.replace(/proto/gi, 'design');
        const nodeId = url.searchParams.get('node-id');

        if (!path || !nodeId) throw new Error();
        editor.value = `https://figma.com${path}?node-id=${nodeId}&node-type=canvas`;
    } catch {
        editor.value = '';
    }
});

editor.addEventListener('click', async () => {
    if (!editor.value) return;

    try {
        await navigator.clipboard.writeText(editor.value);
        const original = editor.value;
        editor.value = '✓ Copied!';
        setTimeout(() => editor.value = original, 1000);
    } catch {
        alert('Copy failed 😕');
    }
});