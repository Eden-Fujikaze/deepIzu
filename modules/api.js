export async function fetchBuild(buildId) {
    const res = await fetch(`https://deepwoken.co/api/proxy/builds/${buildId}`, {
        headers: {
            'Accept': 'application/json',
            'Referer': 'https://deepwoken.co/',
            'Origin': 'https://deepwoken.co',
        }
    });
    if (!res.ok) return null;

    const data = await res.json();
    return {
        name: data.stats.buildName,
        meta: data.stats.meta,
        attributes: data.attributes,
        preShrine: data.preShrine,
        postShrine: data.postShrine,
        talents: data.talents,
        mantras: data.mantras,
    };
}