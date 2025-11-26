import axios from 'axios'

const API_URL = 'https://valorant-api.com/v1'

export const fetchAgents = async () => {
    try {
        const res = await axios.get(`${API_URL}/agents`)
        return res.data.data
        console.log(res.data.data)
    }
    catch (error) {
        console.error('Error fetching agents:', error)
        return []
    }
}

