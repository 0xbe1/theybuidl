import type { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/core'
import { Buidler } from '..'

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN || '' })

const REPOS = [
  'ethereum/go-ethereum',
  'ethereum/solidity',
  'solana-labs/solana',
  'smartcontractkit/chainlink',
  'Uniswap/v2-core',
]

type Result<T> =
  | {
      data: T
      error?: never
    }
  | {
      data?: never
      error: { message: string }
    }

type RepoContributor = {
  login: string
  id: number
  url: string
  contributions: number
}

type User = {
  login: string
  name: string
  company: string | null
  blog: string | null
  email: string | null
  bio: string | null
  twitter_username: string | null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const tryUsers = await Promise.all(REPOS.map((repo) => fetch(repo)))

  let users: Buidler[] = []

  tryUsers.forEach((tryUser) => {
    const { data, error } = tryUser
    if (error) {
      res.status(200).json({ error: { message: error.message } })
    } else {
      users.push(...data)
    }
  })

  res.status(200).json({ data: users })
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
): Promise<Result<RepoContributor[]>> {
  const [owner, repoName] = repo.split('/')
  try {
    const repoContributorsResp = await octokit.request(
      'GET /repos/{owner}/{repo}/contributors',
      {
        owner,
        repo: repoName,
      }
    )
    const repoContributors = repoContributorsResp.data as RepoContributor[]
    return { data: repoContributors }
  } catch (error: any) {
    console.log('fetchRepoContributors: ', error)
    return { error: { message: error.message } }
  }
}

async function fetchUser(username: string): Promise<Result<User>> {
  try {
    const userResp = await octokit.request('GET /users/{username}', {
      username,
    })
    const user = userResp.data as User
    return { data: { ...user } }
  } catch (error: any) {
    console.log('fetchUser: ', error)
    return { error: { message: error.message } }
  }
}
