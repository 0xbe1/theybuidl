import type { NextPage } from 'next'
import Head from 'next/head'
import { Octokit } from '@octokit/core'
import { throttling } from '@octokit/plugin-throttling'

const BOT_GITHUB_LOGINS = [
  'dependabot-preview[bot]',
  'dependabot[bot]',
  'renovate[bot]',
  'metamaskbot',
  'github-actions[bot]',
]

const MIN_CONTRIBUTIONS = 10

const GITHUB_REPOS = [
  // chains
  'bitcoin/bitcoin',
  'ethereum/go-ethereum',
  'ethereum/solidity',
  'solana-labs/solana',
  'terra-money/core',
  'near/nearcore',
  'paritytech/substrate',
  'paritytech/polkadot',
  'ava-labs/avalanchego',
  'cosmos/cosmos-sdk',
  // defi
  'smartcontractkit/chainlink',
  'Uniswap/v2-core',
  'Uniswap/v3-core',
  'aave/protocol-v2',
  'aave/aave-v3-core',
  'curvefi/curve-contract',
  'OlympusDAO/olympus-contracts',
  // devtools
  'NomicFoundation/hardhat',
  'foundry-rs/foundry',
  'ChainSafe/web3.js',
  'ethers-io/ethers.js',
  'OpenZeppelin/openzeppelin-contracts',
  // wallet
  'MetaMask/metamask-extension',
  // infra
  'graphprotocol/graph-node',
  'streamingfast/substreams',
  'ceramicnetwork/ceramic',
  'ArweaveTeam/arweave',
  'ipfs/go-ipfs',
]

type Buidler = {
  login: string
  id: number
  url: string
  name: string
  company: string | null
  blog: string | null
  email: string | null
  bio: string | null
  twitter_username: string | null
  repo: string
  contributions: number
}

type AggBuidler = {
  login: string
  id: number
  url: string
  name: string
  company: string | null
  blog: string | null
  email: string | null
  bio: string | null
  twitter_username: string | null
  // aggregate repo contributions on top of Buidler
  repoContributions: {
    repo: string
    contributions: number
  }[]
}

type Result<T> =
  | {
      data: T
      error?: never
    }
  | {
      data?: never
      error: { message: string }
    }

type GitHubRepoContributor = {
  login: string
  id: number
  url: string
  contributions: number
}

type GitHubUser = {
  login: string
  name: string
  company: string | null
  blog: string | null
  email: string | null
  bio: string | null
  twitter_username: string | null
}

const ThrottledOctokit = Octokit.plugin(throttling)
const throttlingOptions = {
  auth: process.env.GITHUB_ACCESS_TOKEN || '',
  throttle: {
    onRateLimit: (
      retryAfter: number,
      options: Record<string, any>,
      octokit: Octokit
    ) => {
      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url}`
      )

      if (options.request.retryCount === 0) {
        // only retries once
        octokit.log.info(`Retrying after ${retryAfter} seconds!`)
        return true
      }
    },
    onSecondaryRateLimit: (
      retryAfter: number,
      options: Record<string, any>,
      octokit: Octokit
    ) => {
      // does not retry, only logs a warning
      octokit.log.warn(
        `SecondaryRateLimit detected for request ${options.method} ${options.url}`
      )
    },
  },
}
const octokit = new ThrottledOctokit(throttlingOptions)

const Home: NextPage<{
  buidlers: AggBuidler[]
}> = ({ buidlers }) => {
  return (
    <div className="flex min-h-screen flex-col items-center font-mono">
      <Head>
        <title>They Buidl</title>
        <link rel="icon" href="/favicon.ico" />
        {/* <script
          data-token="VLESW6URT5L5"
          async
          src="https://cdn.splitbee.io/sb.js"
        ></script> */}
      </Head>

      <main className="flex w-full flex-1 items-center sm:w-4/5 lg:w-1/2">
        <div className="w-full">
          <div className="">
            <p className="my-10 text-6xl font-bold text-purple-600">
              They Buidl
            </p>
            <div>
              {buidlers.map((buidler) => (
                <Buidler key={buidler.id} buidler={buidler} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="flex h-16 w-full items-center justify-center border-t">
        By&nbsp;
        <a className="text-purple-600" href="https://github.com/0xbe1">
          @0xbe1
        </a>
        &nbsp;
        <a href="https://github.com/0xbe1/buidler3">
          <img src="github.svg" alt="GitHub" className="h-6" />
        </a>
        &nbsp;|&nbsp;Questions?&nbsp;
        <a href="https://discord.gg/u5KUjNZ8wy">
          <img src="discord.svg" alt="Discord" className="h-6" />
        </a>
        &nbsp;
        <a href="https://twitter.com/_0xbe1/status/1511638106554134530">
          <img src="twitter.svg" alt="Twitter" className="h-6" />
        </a>
        &nbsp;
        <a href="https://www.reddit.com/r/thegraph/comments/txi4c6/announcing_startblock_find_a_contracts_startblock/">
          <img src="reddit.svg" alt="Reddit" className="h-6" />
        </a>
      </footer>
    </div>
  )
}

function Buidler(props: { buidler: AggBuidler }) {
  return (
    <div className="my-2 flex rounded-lg border border-purple-600">
      <div className="flex-1 p-2">
        <div>
          <span>
            🐙{' '}
            <a
              className="underline"
              href={`https://github.com/${props.buidler.login}`}
            >
              {props.buidler.login}
            </a>
          </span>
          {props.buidler.name && <span>&nbsp;{props.buidler.name}</span>}
        </div>
        <div>
          {/* TODO: render github link when includes @ */}
          {props.buidler.company && <span>💻 {props.buidler.company}</span>}
        </div>
        <div>
          {props.buidler.twitter_username && (
            <span>
              🐦{' '}
              <a
                className="underline"
                href={`https://twitter.com/${props.buidler.twitter_username}`}
              >
                <LongText text={props.buidler.twitter_username} />
              </a>
            </span>
          )}
        </div>
        <div>
          {props.buidler.email && (
            <span>
              📮{' '}
              <a className="underline" href={`mailto:${props.buidler.email}`}>
                <LongText text={props.buidler.email}/>
              </a>
            </span>
          )}
        </div>
        <div>
          {props.buidler.blog && (
            <span>
              📝{' '}
              <a className="underline" href={props.buidler.blog}>
                <LongText text={props.buidler.blog} />
              </a>
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 p-2">
        {/* TODO: link to contributions */}
        {props.buidler.repoContributions.map((work, i) => (
          <div key={i}>
            {work.repo} ({work.contributions})
          </div>
        ))}
      </div>
    </div>
  )
}

function LongText({text}: {text: string}) {
  const maxLen = 32
  if (text.length <= maxLen) {
    return <span>{text}</span>
  }
  return <span>{text.substring(0, maxLen - 3)}...</span>
}

export async function getStaticProps() {
  const tryUsers = await Promise.all(GITHUB_REPOS.map((repo) => fetch(repo)))
  let buidlers: Buidler[] = []
  for (const tryUser of tryUsers) {
    if (tryUser.error) {
      continue
    } else {
      buidlers.push(...tryUser.data)
    }
  }
  buidlers = buidlers.filter(shouldRender)

  const aggBuidlers = buidlers.reduce<AggBuidler[]>((acc, curr) => {
    const buidler = acc.find((buidler) => buidler.login === curr.login)
    if (buidler) {
      buidler.repoContributions.push({
        repo: curr.repo,
        contributions: curr.contributions,
      })
    } else {
      acc.push({
        login: curr.login,
        id: curr.id,
        url: curr.url,
        name: curr.name,
        company: curr.company,
        blog: curr.blog,
        email: curr.email,
        bio: curr.bio,
        twitter_username: curr.twitter_username,
        repoContributions: [
          {
            repo: curr.repo,
            contributions: curr.contributions,
          },
        ],
      })
    }
    return acc
  }, [])

  // order by contributions
  aggBuidlers.sort((a, b) => {
    return (
      b.repoContributions.reduce((acc, curr) => acc + curr.contributions, 0) -
      a.repoContributions.reduce((acc, curr) => acc + curr.contributions, 0)
    )
  })

  return {
    props: {
      buidlers: aggBuidlers,
    },
  }
}

function shouldRender(buidler: Buidler): boolean {
  if (BOT_GITHUB_LOGINS.includes(buidler.login)) {
    return false
  }
  if (buidler.contributions < MIN_CONTRIBUTIONS) {
    return false
  }
  return true
}

async function fetch(repo: string): Promise<Result<Buidler[]>> {
  try {
    const tryRepoContributors = await fetchRepoContributors(repo)
    if (tryRepoContributors.error) {
      return { error: tryRepoContributors.error }
    }
    const tryUsers = await Promise.all(
      tryRepoContributors.data.map((contributor) =>
        fetchUser(contributor.login)
      )
    )
    let result: Buidler[] = []
    for (let i = 0; i < tryUsers.length; i++) {
      const tryUser = tryUsers[i]
      if (tryUser.error) {
        return { error: tryUser.error }
      }
      const contributor = tryRepoContributors.data[i]
      const user = tryUser.data
      const buidler: Buidler = {
        login: contributor.login,
        id: contributor.id,
        url: contributor.url,
        repo: repo,
        contributions: contributor.contributions,
        name: user.name,
        company: user.company,
        blog: user.blog,
        email: user.email,
        bio: user.bio,
        twitter_username: user.twitter_username,
      }
      result.push(buidler)
    }
    return { data: result }
  } catch (error: any) {
    return { error: { message: error.message } }
  }
}

async function fetchRepoContributors(
  repo: string
): Promise<Result<GitHubRepoContributor[]>> {
  const [owner, repoName] = repo.split('/')
  try {
    const repoContributorsResp = await octokit.request(
      'GET /repos/{owner}/{repo}/contributors',
      {
        owner,
        repo: repoName,
      }
    )
    const repoContributors =
      repoContributorsResp.data as GitHubRepoContributor[]
    return { data: repoContributors }
  } catch (error: any) {
    console.log('fetchRepoContributors: ', error)
    return { error: { message: error.message } }
  }
}

async function fetchUser(username: string): Promise<Result<GitHubUser>> {
  try {
    const userResp = await octokit.request('GET /users/{username}', {
      username,
    })
    const user = userResp.data as GitHubUser
    return { data: { ...user } }
  } catch (error: any) {
    console.log('fetchUser: ', error)
    return { error: { message: error.message } }
  }
}

export default Home
