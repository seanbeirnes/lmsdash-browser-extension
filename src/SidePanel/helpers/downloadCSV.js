export default async function downloadCSV(rows) {
    return new Promise((resolve, reject) => {
        try {
            // Create a Blob with the CSV data and type
            const blob = new Blob([rows], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)

            const a = document.createElement('a')
            const date = new Date()
            a.href = url
            a.download = `lmsdash-export_${date.toISOString()}.csv`
            a.click()
        }
        catch (error) {
            reject()
        }
        resolve()
    })
}
