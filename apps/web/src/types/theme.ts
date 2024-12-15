export interface ThemeVariable {
  [key: string]: string
}

export interface Theme {
  id: string
  name: string
  cssClass: string
  variables: ThemeVariable
}
