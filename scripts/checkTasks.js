const { Octokit } = require('@octokit/core');
const octokit = new Octokit({ auth: process.env.TOKEN });

async function checkTasks() {
  const owner = 'OnnoPeters';
  const otherRepo = process.env.OTHER_REPO_NAME;
  const thisRepo = process.env.THIS_REPO_NAME;
  const prNumber = process.env.PR_NUMBER;

  try {
    const pr = await octokit.request(`GET /repos/${owner}/${otherRepo}/pulls/${prNumber}`, {
      owner,
      otherRepo,
      pull_number: prNumber,
    });


    if (pr.data.state === 'closed' && pr.data.merged) {
      //const updatedComment = `- [x] ${owner}/${otherRepo}#${prNumber}\n`;

      const response = await octokit.request(`GET /repos/${owner}/${thisRepo}/issues/comments`, {
        owner: owner,
        repo: thisRepo,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

      for(const comment of response.data)
      {
          var lines = comment.body.split('\r\n');
          var change = false;
          var updatedComment = "";
          var i = 0;
          for(const line of lines)
          {
            if((line.startsWith("- [ ]") 
            || line.startsWith("-  [ ]")
            || line.startsWith("-   [ ]")
            || line.startsWith("-    [ ]"))
             && line.includes(`${owner}/${otherRepo}#${prNumber}`)) {
              change = true;
              updatedComment += line.replace(/-\s{1,4}\[\s\]/g,"- [x]");

            } else {
              updatedComment += line;
            }
            if(i < lines.length - 1) updatedComment += '\r\n';
          if(change)
          {
            console.log("update", updatedComment);
            await octokit.request(`PATCH /repos/${owner}/${thisRepo}/issues/comments/${comment.id}`, {
              owner,
              repo,
              comment_id: comment.id,
              body: updatedComment,
              });
          }
          i++;
        }
      }

      console.log('Task checked');
    } else {
      console.log('PR not merged');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTasks();
