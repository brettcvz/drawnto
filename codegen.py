ROWS = 3
COLS = 3
COUNT = ROWS * COLS

from app import db


def tup(i):
    return (i % ROWS, i / COLS)


def generate_choices():
    #DFS
    seqs = [[]]
    for seq in seqs:
        choices = possible_next_steps(seq)
        if choices:
            seqs.extend([seq + [choice] for choice in choices])

    return seqs


def possible_next_steps(seq):
    #All
    if len(seq) == 0:
        return range(COUNT)

    choices = []
    for i in range(COUNT):
        #Can't double back
        if i in seq:
            continue
        last = seq[-1]
        #Must be connected to last one
        x, y = tup(i)
        px, py = tup(last)
        if abs(x - px) > 1 or abs(y - py) > 1:
            continue
        choices.append(i)
    return choices


def store_sequence(seq):
    rec = db.records.Record()
    rec.sequence = unicode(",".join(map(str, seq)))
    rec.used = False
    rec.length = len(seq)
    rec.save()


def print_seq(seq):
    grid = [['x'] * COLS for _ in range(ROWS)]
    for i in range(len(seq)):
        pos = seq[i]
        x, y = tup(pos)
        grid[x][y] = i

    print "\n".join([",".join(map(str, row)) for row in grid])

if __name__ == '__main__':
    seqs = generate_choices()
    sixers = filter(lambda x: len(x) == 6, seqs)

    for seq in sixers:
        store_sequence(seq)
    """
    print "Total sequences: %d" % (len(seqs))
    print "Of length:"
    for i in range(COUNT + 1):
        print "%d: %d" % (i, len(filter(lambda x: len(x) == i, seqs)))
    """
