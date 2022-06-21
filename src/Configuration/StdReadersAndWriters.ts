
const StandardRnW: StdWriters = {
    //SequenceReader: Config.readSequence,
    SequenceWriter: (seq) => Config.writeSequence(seq),
    //KeyPassReader: Config.readKeyPass,
    KeyPassWriter: (kp) => Config.writeKeyPass(kp)
};