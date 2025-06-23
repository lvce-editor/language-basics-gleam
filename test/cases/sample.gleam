pub fn main() {
  // Run loads of green threads, no problem
  list.range(0, 200_000)
  |> list.each(fn(i) {
    let n = int.to_string(i)
    io.println("Hello from " <> n)
  })
}