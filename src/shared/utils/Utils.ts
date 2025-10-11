export class Utils
{
  static async sleep(time: number): Promise<void>
  {
    return new Promise<void>((resolve) =>
    {
      setTimeout(resolve, time);
    });
  }

  static debounce<T extends (...args: any[]) => void>(
    func: T,
    wait = 100
  ): (this: ThisParameterType<T>, ...args: Parameters<T>) => void
  {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function(this: ThisParameterType<T>, ...args: Parameters<T>)
    {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() =>
      {
        func.apply(this, args);
      }, wait);
    };
  }
}