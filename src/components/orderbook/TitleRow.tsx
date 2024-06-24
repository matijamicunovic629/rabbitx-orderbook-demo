import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  gap: 10px;

  > span {
    flex: 1;
    padding: 0px 2px;
  }
`;

const TitleRow = () => {

    return (
        <Container>
            <span>
                Price
            </span>
            <span className="justify-end">
                Amount
            </span>
            <span className="justify-end">
                Total
            </span>
        </Container>
    );
};

export default TitleRow;
