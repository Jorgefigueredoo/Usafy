/** Id de cada opção da lista, usado pelo `aria-activedescendant` do campo. */
export function optionId(listId: string, index: number): string {
  return `${listId}-option-${index}`;
}
