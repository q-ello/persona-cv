export const fetchObjectives = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/timeline/objectives`);

      console.log(response)
    }