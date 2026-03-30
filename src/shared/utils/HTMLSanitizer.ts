export default class HTMLSanitizer
{
  // Converts HTML to plaintext
  static sanitize(html: string): string
  {
    const textItems: string[] = [];

    let tempString = "";

    for (let i = 0; i < html.length; i++)
    {
      if (html[i] === '<' && tempString)
      {
        // Add the plaintext element to array and reset for the tag element
        textItems.push(HTMLSanitizer.cleanText(tempString));
        tempString = html[i];
      } else if (html[i] === '>' || i === html.length - 1)
      {
        // Ignore the tag element reset for next element
        tempString = "";
      } else
      {
        tempString += html[i];
      }
    }

    return textItems.join("");
  }

  // Cleans the text of HTML symbols and unnecessary ASCII characters
  private static cleanText(text: string): string
  {
    if (text.includes("&")) text = HTMLSanitizer.removeSymbols(text);
    if (text.includes("\n")) text = HTMLSanitizer.removeNewLines(text);

    return text;
  }

  private static removeNewLines(text: string): string
  {
    return text.replace(/\n/g, " ");
  }

  // Cleans text of HTML symbol codes, hex codes, and entities
  private static removeSymbols(text: string): string
  {
    return text.replace(/&[#\w]{2,17};/g, "");
  }
}