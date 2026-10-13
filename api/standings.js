
export async function GET() {
    try {
        const response = await fetch(
            "https://www.bssl.com/scripts/tables.js"
        );

        const script = await response.text();

        return Response.json({
            success: response.ok,
            status: response.status,
            preview: script.slice(0, 5000)
        });
    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
