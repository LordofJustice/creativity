export const getText = async () => {
  try {
    const url = "https://en.wikipedia.org/api/rest_v1/page/random/summary";
    const response = await fetch(url);
    if (!response.ok) throw "Bad URL Response";
    const data = await response.json();
    return data.extract;
  } catch (err) {
    console.log(`ERROR : ${err}`);
    showTerminalCursor();
    Deno.exit(1);
  }
};
