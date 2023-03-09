import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const animal = req.body.animal || '';
  if (animal.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "请输入问题",
      }
    });
    return;
  }

  const response = await openai.createCompletion(
    {
      model: 'text-davinci-003',
      prompt: animal,
      max_tokens: 2048,
      temperature: 0,
      stream: true,
    },
    { responseType: 'stream' },
  );
  const stream = response.data;
  let streamHead = true;
  // Send the end of the stream on stream end
  stream.on("end", () => {
      res.end();
  });

  // If an error is received from the completion stream, send an error message and end the response stream
  stream.on("error", (error) => {
      console.error(error);
      res.end(JSON.stringify({ error: true, message: "Error generating response." }));
  });
  stream.on('data', data => {
    const lines = data
      .toString()
      .split('\n')
      .filter(line => line.trim() !== '');
    for (const line of lines) {
      const message = line.replace(/^data: /, '');
      if (message === '[DONE]') {
        return; // Stream finished
      }
      try {
        console.log('message', message);
        const parsed = JSON.parse(message);
        res.write(parsed?.choices?.[0]?.text || '');
        streamHead = false;
        res.flush();
      } catch (error) {
        // End the stream but do not send the error, as this is likely the DONE message from createCompletion
        console.error(error);
        res.end();
      }
    }
  });

  /* try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: generatePrompt(animal),
      n: 1,
      max_tokens: 2048,
      temperature: 0.6,
    });
    res.status(200).json({ result: completion.data.choices.map(item => item.text).join('') });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  } */
}
