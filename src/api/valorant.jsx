import axios from 'axios'

const API_URL = 'https://valorant-api.com/v1'

export const fetchAgents = async () => {
    try {
        const res = await axios.get(`${API_URL}/agents`, {
            params: {
                language: 'en-US',
                isPlayableCharacter: true
            }
        })
        return res.data.data
    }
    catch (error) {
        console.error('Error fetching agents:', error)
        return []
    }
}

export const fetchWeapons = async () => {
    try {
        const res = await axios.get(`${API_URL}/weapons`, {
            params: {
                language: 'en-US'
            }
        })
        return res.data.data
    }
    catch (error) {
        console.error('Error fetching weapons:', error)
        return []
    }
}

export const fetchWeaponSkins = async () => {
    try {
        const res = await axios.get(`${API_URL}/weapons/skins`, {
            params: {
                language: 'en-US'
            }
        })
        return res.data.data
    }
    catch (error) {
        console.error('Error fetching weapon skins:', error)
        return []
    }
}

export const fetchContentTiers = async () => {
    try {
        const res = await axios.get(`${API_URL}/contenttiers`, {
            params: {
                language: 'en-US'
            }
        })
        return res.data.data
    }
    catch (error) {
        console.error('Error fetching content tiers:', error)
        return []
    }
}

export const fetchThemes = async () => {
    try {
        const res = await axios.get(`${API_URL}/themes`, {
            params: {
                language: 'en-US'
            }
        })
        return res.data.data
    }
    catch (error) {
        console.error('Error fetching themes:', error)
        return []
    }
}

