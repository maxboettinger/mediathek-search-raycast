export function parseQuery(query: string) {
  return new Promise((resolve, reject) => {
    const channels = [];
    const topics = [];
    const titles = [];
    const descriptions = [];
    let generics: any = [];
    let duration_min = undefined;
    let duration_max = undefined;

    try {
      const splits = query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((split) => {
          return split.length > 0;
        });

      for (let i = 0; i < splits.length; i++) {
        const split = splits[i];

        if (split[0] == "!") {
          const c = split
            .slice(1, split.length)
            .split(",")
            .filter((split) => {
              return split.length > 0;
            });
          if (c.length > 0) {
            channels.push(c);
          }
        } else if (split[0] == "#") {
          const t = split
            .slice(1, split.length)
            .split(",")
            .filter((split) => {
              return split.length > 0;
            });
          if (t.length > 0) {
            topics.push(t);
          }
        } else if (split[0] == "+") {
          const t = split
            .slice(1, split.length)
            .split(",")
            .filter((split) => {
              return split.length > 0;
            });
          if (t.length > 0) {
            titles.push(t);
          }
        } else if (split[0] == "*") {
          const d = split
            .slice(1, split.length)
            .split(",")
            .filter((split) => {
              return split.length > 0;
            });
          if (d.length > 0) {
            descriptions.push(d);
          }
        } else if (split[0] == ">") {
          const d: any = split
            .slice(1, split.length)
            .split(",")
            .filter((split) => {
              return split.length > 0;
            });
          if (d.length > 0 && !isNaN(d[0])) {
            duration_min = d[0] * 60;
          }
        } else if (split[0] == "<") {
          const d: any = split
            .slice(1, split.length)
            .split(",")
            .filter((split) => {
              return split.length > 0;
            });
          if (d.length > 0 && !isNaN(d[0])) {
            duration_max = d[0] * 60;
          }
        } else {
          generics = generics.concat(split.split(/\s+/));
        }
      }

      resolve({
        channels: channels,
        topics: topics,
        titles: titles,
        descriptions: descriptions,
        duration_min: duration_min,
        duration_max: duration_max,
        generics: generics,
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function build_query(queryString: any, parsedQuery: any) {
  return new Promise((resolve, reject) => {
    const queries = [];

    try {
      for (let i = 0; i < parsedQuery.channels.length; i++) {
        queries.push({
          fields: ["channel"],
          query: parsedQuery.channels[i].join(" "),
        });
      }

      for (let i = 0; i < parsedQuery.topics.length; i++) {
        queries.push({
          fields: ["topic"],
          query: parsedQuery.topics[i].join(" "),
        });
      }

      for (let i = 0; i < parsedQuery.titles.length; i++) {
        queries.push({
          fields: ["title"],
          query: parsedQuery.titles[i].join(" "),
        });
      }

      for (let i = 0; i < parsedQuery.descriptions.length; i++) {
        queries.push({
          fields: ["description"],
          query: parsedQuery.descriptions[i].join(" "),
        });
      }

      if (parsedQuery.generics.length > 0) {
        const temp = false; // ! another reaaally dirty fix for now...
        queries.push({
          fields: temp
            ? ["channel", "topic", "title", "description"]
            : parsedQuery.topics.length == 0
            ? ["topic", "title"]
            : ["title"],
          query: parsedQuery.generics.join(" "),
        });
      }

      resolve({
        queries: queries,
        sortBy: "timestamp",
        sortOrder: "desc",
        future: true,
        offset: 0,
        //size: 10,
        duration_min: parsedQuery.duration_min,
        duration_max: parsedQuery.duration_max,
      });
    } catch (error) {
      reject(error);
    }
  });
}
