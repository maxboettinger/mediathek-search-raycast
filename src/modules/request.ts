import axios from "axios";

export function queryApi(query: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    //signale.pending("Searching for '%s'", term);

    try {
      const { data } = await axios({
        method: "post",
        url: "https://mediathekviewweb.de/api/query",
        data: JSON.stringify(query),
        headers: { "Content-Type": "text/plain" },
      });

      //console.log(data.result);

      resolve(data.result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error);
        reject(error);
      } else {
        reject(error);
      }
    }
  });
}

/*export function downloadFile(user_path: any, item_detail: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    console.log("");
    signale.start("Starting download for '%s'", item_detail.title);
    signale.pending("Downloading...");

    const file_type = "." + item_detail.url_video_hd.split(".").pop();
    const file_name = item_detail.title
      .replaceAll(" ", "_")
      .replaceAll(",", "")
      .replaceAll(":", "");

    https.get(item_detail.url_video_hd, (res: any) => {
      const path = user_path + file_name + file_type;
      const writeStream = fs.createWriteStream(path);

      res.pipe(writeStream);

      writeStream.on("finish", () => {
        writeStream.close();
        signale.success("File saved @ " + path);
        resolve(true);
      });
    });
  });
}*/
