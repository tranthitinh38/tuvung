// VOCABWORLD AI Chrome Extension Content Script
console.log('VOCABWORLD AI Content Script Loaded');

document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection()?.toString().trim();
  if (selectedText && selectedText.length > 0 && selectedText.length < 50) {
    // Send message or trigger highlight action
    console.log('VOCABWORLD AI highlighted word:', selectedText);
  }
});
