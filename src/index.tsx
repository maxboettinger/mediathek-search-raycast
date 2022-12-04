import { List, getPreferenceValues, ActionPanel, showToast, Action, Toast } from "@raycast/api";
import { ReactElement, useEffect, useState } from "react";
import { queryApi } from "./modules/request";
import moment from "moment";

interface QueryArguments {
  title: string;
  channel?: string;
}

export default function Command(props: { arguments: QueryArguments }) {
  const { title, channel } = props.arguments;
  const [isLoading, setIsLoading] = useState(false);
  const [toTranslate, setToTranslate] = useState("");
  const [results, setResults] = useState<{ results: [] }[]>([]);

  useEffect(() => {
    // this is a dirty fix
    setToTranslate(title + " !" + channel);

    if (toTranslate === "") {
      return;
    }

    showToast({ title: "Searching...", message: "waiting for results...", style: Toast.Style.Animated });

    setIsLoading(true);
    setResults([]);

    const query = build_query(toTranslate);

    const promises = Promise.all([queryApi(query)]);

    promises
      .then((res: any) => {
        setResults(res[0].results);
        showToast({
          title: "Success",
          message:
            "Found " + res[0].queryInfo.totalResults + " results in " + res[0].queryInfo.searchEngineTime + "ms!",
          style: Toast.Style.Success,
        });
      })
      .catch((errors) => {
        showToast({ title: "Error!", message: errors, style: Toast.Style.Failure });
      })
      .then(() => {
        setIsLoading(false);
      });
  }, [toTranslate]);

  return (
    <List
      searchBarPlaceholder="Find in results..."
      navigationTitle="Search OER Mediathek"
      onSearchTextChange={setToTranslate}
      isLoading={isLoading}
      throttle
    >
      {results.map((r: any, index) => (
        <List.Item
          key={index}
          title={r.title}
          subtitle={r.topic + " / " + r.channel}
          accessoryTitle={(r.duration / 60).toFixed(2) + "m - " + moment(r.timestamp, "X").format("DD.MM.YYYY HH:mm")}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action.Open title="Playback" target={r.url_video_hd} />
                <Action.CopyToClipboard title="Copy" content={r.url_video_hd} />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function parseQuery(query: string) {
  const channels = [];
  const topics = [];
  const titles = [];
  const descriptions = [];
  let generics: any = [];
  let duration_min = undefined;
  let duration_max = undefined;

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

  return {
    channels: channels,
    topics: topics,
    titles: titles,
    descriptions: descriptions,
    duration_min: duration_min,
    duration_max: duration_max,
    generics: generics,
  };
}

function build_query(queryString: any) {
  //return new Promise((resolve, reject) => {
  const parsedQuery = parseQuery(queryString);
  const queries = [];

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
    queries.push({
      fields: false
        ? ["channel", "topic", "title", "description"]
        : parsedQuery.topics.length == 0
        ? ["topic", "title"]
        : ["title"],
      query: parsedQuery.generics.join(" "),
    });
  }

  return {
    queries: queries,
    sortBy: "timestamp",
    sortOrder: "desc",
    future: true,
    offset: 0,
    //size: 10,
    duration_min: parsedQuery.duration_min,
    duration_max: parsedQuery.duration_max,
  };
  //});
}
