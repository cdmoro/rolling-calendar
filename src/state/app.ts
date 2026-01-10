import type { State } from '../types/app';

export const state: State = {
  language: 'en',
  theme: 'auto',
  color: 'blue',
  documents: [],
  currentDocumentId: null,
};

export function initState() {
  const savedLanguage = localStorage.getItem('language') as State['language'];
  const savedTheme = localStorage.getItem('theme');
  const savedDocuments = localStorage.getItem('documents');
  const savedCurrentDocumentId = localStorage.getItem('currentDocumentId');

  state.language = savedLanguage ?? state.language;

  if (savedTheme) {
    const [theme, color] = savedTheme.split('-') as [
      State['theme'],
      State['color']
    ];

    state.theme = theme ?? state.theme;
    state.color = color ?? state.color;
  }

  try {
    if (savedDocuments) {
      state.documents = JSON.parse(savedDocuments) as State['documents'];
    }
  } catch (e) {
    state.documents = [];
  }

  if (state.documents.length > 0 && state.documents.some(doc => doc.id === savedCurrentDocumentId)) {
    state.currentDocumentId = savedCurrentDocumentId;
  }
}
