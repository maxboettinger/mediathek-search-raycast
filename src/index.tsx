import { List, ActionPanel, showToast, Action, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { queryApi } from "./modules/request";
import moment from "moment";
import { build_query, parseQuery } from "./modules/query.module";

interface QueryArguments {
  title: string;
  channel?: string;
  topic?: string;
}

export default function Command(props: { arguments: QueryArguments }) {
  const { title, channel, topic } = props.arguments;
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [resultSearch, setResultSearch] = useState("");
  const [results, setResults] = useState<{ results: [] }[]>([]);

  useEffect(() => {
    // ? handling state
    setUserInput(title + " !" + channel + " #" + topic); // setting the user input
    setIsLoading(true); // setting the loading state
    setResults([]); // resetting the results

    // ? UI handling
    showToast({ title: "Searching...", message: "waiting for results...", style: Toast.Style.Animated });

    // ? building the actual query string
    parseQuery(userInput)
      .then((parsed_query) => {
        build_query(userInput, parsed_query)
          .then((query) => {
            // ? sending the query to the API
            const apiRequestPromises = Promise.all([queryApi(query)]);

            apiRequestPromises
              .then((res: any) => {
                // ? setting the results
                setResults(res[0].results);

                // ? UI handling
                showToast({
                  title: "Success",
                  message:
                    "Found " +
                    res[0].queryInfo.totalResults +
                    " results in " +
                    res[0].queryInfo.searchEngineTime +
                    "ms!",
                  style: Toast.Style.Success,
                });
              })
              .catch((errors) => {
                showToast({ title: "Error!", message: errors, style: Toast.Style.Failure });
              })
              .then(() => {
                setIsLoading(false);
              });
          })
          .catch((errors) => {
            showToast({ title: "Error!", message: errors, style: Toast.Style.Failure });
          })
          .then(() => {
            setIsLoading(false);
          });
      })
      .catch((errors) => {
        showToast({ title: "Error!", message: errors, style: Toast.Style.Failure });
      })
      .then(() => {
        setIsLoading(false);
      });
  }, [userInput]);

  return (
    <List
      searchBarPlaceholder="Search in results..."
      navigationTitle="Search OER Mediathek"
      isLoading={isLoading}
      throttle
      isShowingDetail
    >
      {results.map((r: any, index) => (
        <List.Item
          key={index}
          title={r.title}
          detail={
            <List.Item.Detail
              markdown={`## ${r.title} \n **Topic:** ${r.topic} \n\n **Channel:** ${r.channel} \n\n **Duration:** ${r.duration} \n\n **File size:** ${r.size} \n\n **Date:** ${r.timestamp} \n\n **Description:** *${r.description}*`}
            />
          }
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action.Open title="Play" target={r.url_video_hd} />
                <Action.CopyToClipboard title="Copy URL" content={r.url_video_hd} />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
