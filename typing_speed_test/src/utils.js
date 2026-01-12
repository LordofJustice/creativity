export const hideTerminalCursor = () =>
  Deno.stdout.writeSync(encode("\x1B[?25l"));

export const showTerminalCursor = () =>
  Deno.stdout.writeSync(encode("\x1B[?25h"));

export const setRawMode = () => Deno.stdin.setRaw(true, { cbreak: true });

export const exitRawMode = () => Deno.stdin.setRaw(false);

export const decode = (encodedText) => new TextDecoder().decode(encodedText);

export const encode = (text) => new TextEncoder().encode(text);

export const write = async (text) => {
  console.clear();
  const encodedText = encode(text);
  await Deno.stdout.write(encodedText);
};
