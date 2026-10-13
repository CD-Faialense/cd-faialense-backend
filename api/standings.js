
export async function GET() {
    try {
        const response = await fetch(
            "https://www.bssl.com/scripts/tables.php?format=full&year=2026"
        );

        const html = await response.text();

        return Response.json({
            success: response.ok,
            status: response.status,
            contentType: response.headers.get("content-type"),
            preview: html.slice(0, 5000)
        });
    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
