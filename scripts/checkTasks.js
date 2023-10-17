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
      const updatedComment = `- [x] ${owner}/${otherRepo}#${prNumber}\n`;

      const response = await octokit.request(`GET /repos/${owner}/${thisRepo}/issues/comments`, {
        owner: owner,
        repo: thisRepo,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

      for(const comment of response.data)
      {
          if(comment.body.includes(`${owner}/${otherRepo}#${prNumber}`)) {
            await octokit.request(`PATCH /repos/${owner}/${thisRepo}/issues/comments/${comment.id}`, {
            owner,
            repo,
            comment_id: comment.id,
            body: updatedComment,
            });
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
