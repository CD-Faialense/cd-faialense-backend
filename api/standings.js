
export function GET() {
    return Response.json({
        standings: [
            {
                position: 1,
                team: "CD Faialense",
                played: 10,
                wins: 7,
                draws: 2,
                losses: 1,
                goalsFor: 29,
                goalsAgainst: 11,
                goalDifference: 18,
                points: 23
            }
        ]
    });
}
