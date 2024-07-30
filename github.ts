import { Octokit } from "octokit"

export const createOrUpdateRelease = async (opts: {
    tag: string, releaseName: string, releaseNotes: string, token: string, upload_file_name: string, upload_file_path: string
}) => {
    const { tag, releaseName, releaseNotes, token, upload_file_name, upload_file_path } = opts

    const octokit = new Octokit({ auth: token }).rest

    const { data: releaseList } = await octokit.repos.listReleases({
        owner: 'MicroCBer',
        repo: 'nanode'
    })

    const release = releaseList.find(release => release.tag_name === tag)
    if (release) {
        await octokit.repos.updateRelease({
            owner: 'MicroCBer',
            repo: 'nanode',
            release_id: release.id,
            tag_name: tag,
            name: releaseName,
            body: releaseNotes
        })

        if (upload_file_name && upload_file_path && (release && release.assets.some(asset => asset.name === upload_file_name))) {
            await octokit.repos.deleteReleaseAsset({
                owner: 'MicroCBer',
                repo: 'nanode',
                asset_id: release.assets.find(asset => asset.name === upload_file_name)!.id
            })
        }

        await octokit.repos.uploadReleaseAsset({
            owner: 'MicroCBer',
            repo: 'nanode',
            release_id: release.id,
            name: upload_file_name,
            data: require('fs').readFileSync(upload_file_path)
        })
    } else {
        const { data } = await octokit.repos.createRelease({
            owner: 'MicroCBer',
            repo: 'nanode',
            tag_name: tag,
            name: releaseName,
            body: releaseNotes
        })

        await octokit.repos.uploadReleaseAsset({
            owner: 'MicroCBer',
            repo: 'nanode',
            release_id: data.id,
            name: upload_file_name,
            data: require('fs').readFileSync(upload_file_path)
        })
    }
}