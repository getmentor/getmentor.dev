export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
  res.status(200).json({})
}
