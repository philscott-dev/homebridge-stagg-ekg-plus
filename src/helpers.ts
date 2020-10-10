export function celsiusToFahrenheit(celsius: number) {
  return celsius * (9 / 5) + 32
}

export function fahrenheitToCelsius(fahrenheit: number) {
  return (fahrenheit - 32) * (5 / 9)
}
