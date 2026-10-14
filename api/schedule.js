
import * as cheerio from "cheerio";

const corsHeaders = {
    "Access-Control-Allow-Origin": "https://cd-faialense.github.io",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

function jsonResponse(data, status = 200) {
    return Response.json(data, {
        status,
        headers: corsHeaders
    });
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}

export async function GET() {
    try {
        const response = await fetch(
            "https://www.bssl.com/scripts/results.php?division=D1"
        );

        if (!response.ok) {
            return jsonResponse({
                error: "Could not retrieve BSSL schedule",
                status: response.status
            }, 502);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const matches = [];
        let currentDate = "";

        $("tr").each((_, row) => {
            const cells = $(row).find("td");

            if (cells.length < 9) return;

            const values = cells.map((_, cell) =>
                $(cell).text().trim()
            ).get();

            // First column contains the match date.
            if (values[0]) {
                currentDate = values[0];
            }

            const homeTeam = values[1];
            const homeScoreText = values[2];
            const awayScoreText = values[3];
            const awayTeam = values[4];

            // Ignore headings and rows without two teams.
            if (!homeTeam || !awayTeam) return;

            // Ignore section headings such as cup rounds.
            if (
                homeTeam.toUpperCase().includes("ROUND OF THE BSSL CUP") ||
                homeTeam.toUpperCase().includes("CUP SEMIFINAL") ||
                homeTeam.toUpperCase().includes("CUP FINAL") ||
                homeTeam.toUpperCase().includes("DEADLINE") ||
                homeTeam.toUpperCase().includes("PLAYOFF")
            ) return;

            const hasScores =
                homeScoreText !== "" &&
                awayScoreText !== "" &&
                !Number.isNaN(Number(homeScoreText)) &&
                !Number.isNaN(Number(awayScoreText));

            matches.push({
                date: currentDate,
                homeTeam,
                awayTeam,
                homeScore: hasScores ? Number(homeScoreText) : null,
                awayScore: hasScores ? Number(awayScoreText) : null,
                time: values[6] || "",
                field: values[7] || "",
                rescheduledDate: values[8] || ""
            });
        });

        return jsonResponse({ matches });
    } catch (error) {
        return jsonResponse({
            error: "Failed to process BSSL schedule",
            details: error.message
        }, 500);
    }
}
