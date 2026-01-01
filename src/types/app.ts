export type Language = 'en' | 'es'
export type Theme = 'light' | 'dark'
export type Color = 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'teal'

export type State = {
    language: Language;
    theme: Theme;
    color?: Color;
}